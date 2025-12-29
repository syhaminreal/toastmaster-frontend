/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
};

module.exports = nextConfig;

// File: toastmaster-backend/src/events/events.controller.ts
// @@ -1,10 +1,10 @@
//  import {
//    Controller,
//    Get,
//    Post,
//    Body,
//    Patch,
//    Param,
//    Delete,
//    UseInterceptors,
//    UploadedFile,
//  } from '@nestjs/common';
//  import { FileInterceptor } from '@nestjs/platform-express';
//  import { EventsService } from './events.service';
//  import { CreateEventDto } from './dto/createEvent.dto';
//  import { UpdateEventDto } from './dto/updateEvent.dto';
//  import { storage } from '../files/cloudinary-storage';
 
//  @Controller('events')
//  export class EventsController {
//    constructor(private readonly eventsService: EventsService) {}
 
//    // ================= CREATE =================
//    @Post()
//    @UseInterceptors(FileInterceptor('image', { storage }))
//    create(
//      @UploadedFile() file: Express.Multer.File,
//      @Body() dto: CreateEventDto,
//    ) {
//      return this.eventsService.create({
//        ...dto,
//        image: file?.path  || '',
//      });
//    }    