import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export const getDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentCategory } = req.query;

    const whereClause = { userId };
    if (documentCategory) {
      whereClause.documentCategory = documentCategory;
    }

    const documents = await prisma.userDocument.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentName, documentCategory, fileType, fileSizeBytes, expiryDate, fileUrl, fileData } = req.body;

    const finalUrl = fileData || fileUrl || `data:application/pdf;base64,`;

    const document = await prisma.userDocument.create({
      data: {
        userId,
        documentName: documentName || 'Document.pdf',
        documentCategory: documentCategory || 'Certificate',
        fileUrl: finalUrl,
        fileType: fileType || 'application/pdf',
        fileSizeBytes: parseInt(fileSizeBytes) || 102400,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await prisma.userDocument.findFirst({
      where: { id, userId }
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { documentName, documentCategory, expiryDate } = req.body;

    const document = await prisma.userDocument.findFirst({
      where: { id, userId }
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    const updatedDocument = await prisma.userDocument.update({
      where: { id },
      data: {
        documentName,
        documentCategory,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    res.json(updatedDocument);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await prisma.userDocument.findFirst({
      where: { id, userId }
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    await prisma.userDocument.delete({
      where: { id }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getStorageUsage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await prisma.userDocument.aggregate({
      where: { userId },
      _sum: { fileSizeBytes: true }
    });

    const used = result._sum.fileSizeBytes || 0;
    const total = 104857600; // 100MB
    const percentage = (used / total) * 100;

    res.json({ used, total, percentage: percentage.toFixed(2) });
  } catch (error) {
    next(error);
  }
};
