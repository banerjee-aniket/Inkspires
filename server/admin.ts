import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/prisma'; // Correct import
import { PrismaClient } from '@prisma/client';
import express from 'express';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Register AdminJS Prisma Adapter
AdminJS.registerAdapter({ Database, Resource });

// Initialize AdminJS with Prisma
const admin = new AdminJS({
  resources: [
      {
            resource: prisma, // Use Prisma as the database
                  options: {},
                      },
                        ],
                          rootPath: '/admin', // Admin Panel Path
                          });

                          // Create Express Router for AdminJS
                          const adminRouter = AdminJSExpress.buildRouter(admin);

                          export { admin, adminRouter };