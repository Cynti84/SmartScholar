import { AppDataSource } from "../utils/db";
import { Bookmark } from "../models/Bookmark";

export const BookmarkRepository = AppDataSource.getRepository(Bookmark);
