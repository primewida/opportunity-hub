import prisma from '../config/database.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      }
    });

    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      const otherParticipant = conv.participants.find(p => p.userId !== userId)?.user;
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          isRead: false,
          senderId: { not: userId }
        }
      });

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        otherParticipant,
        lastMessage: conv.messages[0] || null,
        unreadCount
      };
    }));

    res.json(formattedConversations);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { sentAt: 'asc' }
    });

    // Mark unread as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { userId: recipientId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: senderId } } },
          { participants: { some: { userId: recipientId } } }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: senderId },
              { userId: recipientId }
            ]
          }
        }
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content
      }
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
