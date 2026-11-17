declare module "*.css";

declare namespace NodeJS {
  interface ProcessEnv {
    NOTION_API_KEY?: string;
    NOTION_DATABASE_ID?: string;
    NOTION_SERIES_DATA_SOURCE_ID?: string;
  }
}
