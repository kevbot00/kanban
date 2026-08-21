import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardsModule } from './cards/cards.module';
import { BoardsModule } from './boards/boards.module';

@Module({
  imports: [CardsModule, BoardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
