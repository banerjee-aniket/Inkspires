import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';
import express from 'express';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Register AdminJS Prisma Adapter
AdminJS.registerAdapter({ Database, Resource });

// Define Prisma models for AdminJS
const admin = new AdminJS({
  resources: [
      {
            resource: { model: prisma.user }, // Example: Replace 'user' with your actual model
                  options: {}, 
                      },
                          {
                                resource: { model: prisma.post }, // Example: Replace 'post' with another model if needed
                                      options: {},
                                          }
                                            ],
                                              rootPath: '/admin', // Admin Panel Path
                                              });

                                              // Create Express Router for AdminJS
                                              const adminRouter = AdminJSExpress.buildRouter(admin);

                                              export { admin, adminRouter };