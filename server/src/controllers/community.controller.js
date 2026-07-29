import prisma from '../config/database.js';

export const getGroups = async (req, res, next) => {
  try {
    const groups = await prisma.communityGroup.findMany({
      include: {
        _count: {
          select: { members: true, posts: true }
        }
      }
    });

    if (req.user) {
      // Auth is present, check if user has joined
      const joinedGroups = await prisma.groupMember.findMany({
        where: { userId: req.user.id }
      });
      const joinedIds = new Set(joinedGroups.map(g => g.groupId));
      
      const groupsWithStatus = groups.map(group => ({
        ...group,
        isMember: joinedIds.has(group.id)
      }));
      return res.json(groupsWithStatus);
    }

    res.json(groups);
  } catch (error) {
    next(error);
  }
};

export const getMyGroups = async (req, res, next) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.user.id },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true, posts: true }
            }
          }
        }
      }
    });
    const groups = memberships.map(m => m.group);
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

export const joinGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.groupMember.create({
      data: {
        groupId: id,
        userId: req.user.id
      }
    });
    res.json({ message: 'Joined group' });
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.groupMember.deleteMany({
      where: {
        groupId: id,
        userId: req.user.id
      }
    });
    res.json({ message: 'Left group' });
  } catch (error) {
    next(error);
  }
};

export const getGroupPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { groupId: id },
      include: {
        user: { select: { firstName: true, lastName: true, id: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const post = await prisma.post.create({
      data: {
        content,
        groupId: id,
        userId: req.user.id
      }
    });
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.$transaction(async (tx) => {
      const createdComment = await tx.comment.create({
        data: {
          content,
          postId: id,
          userId: req.user.id
        }
      });
      await tx.post.update({
        where: { id },
        data: { commentCount: { increment: 1 } }
      });
      return createdComment;
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const voteOnPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up' or 'down'

    const post = await prisma.$transaction(async (tx) => {
      // upsert post vote
      const existingVote = await tx.postVote.findFirst({
        where: { postId: id, userId: req.user.id }
      });

      if (existingVote) {
        await tx.postVote.update({
          where: { id: existingVote.id },
          data: { voteType }
        });
      } else {
        await tx.postVote.create({
          data: {
            postId: id,
            userId: req.user.id,
            voteType
          }
        });
      }

      // Recalculate upvotes and downvotes
      const upvotes = await tx.postVote.count({
        where: { postId: id, voteType: 'up' }
      });
      const downvotes = await tx.postVote.count({
        where: { postId: id, voteType: 'down' }
      });

      const updatedPost = await tx.post.update({
        where: { id },
        data: { upvotes, downvotes }
      });
      return updatedPost;
    });

    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, id: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getTrending = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, id: true } }
      },
      orderBy: { upvotes: 'desc' },
      skip,
      take: limit
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};
