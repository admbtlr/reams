export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Annotation: {
        Row: {
          _id: string
          created_at: string
          item_id: string | null
          note: string | null
          serialized: string
          text: string
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          _id?: string
          created_at: string
          item_id?: string | null
          note?: string | null
          serialized: string
          text: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          _id?: string
          created_at?: string
          item_id?: string | null
          note?: string | null
          serialized?: string
          text?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Annotation_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      Feed: {
        Row: {
          description: string | null
          etag: string | null
          id: number
          last_accessed: string | null
          root_url: string
          title: string
          url: string
        }
        Insert: {
          description?: string | null
          etag?: string | null
          id?: number
          last_accessed?: string | null
          root_url: string
          title: string
          url: string
        }
        Update: {
          description?: string | null
          etag?: string | null
          id?: number
          last_accessed?: string | null
          root_url?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      Item: {
        Row: {
          _id: string
          created_at: string
          title: string | null
          url: string
        }
        Insert: {
          _id: string
          created_at?: string
          title?: string | null
          url: string
        }
        Update: {
          _id?: string
          created_at?: string
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      User_Feed: {
        Row: {
          created_at: string | null
          feed_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feed_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          feed_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "User_Feed_feed_id_fkey"
            columns: ["feed_id"]
            referencedRelation: "Feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "User_Feed_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      User_ReadItem: {
        Row: {
          inserted_at: string
          item_id: number
          user_id: number
        }
        Insert: {
          inserted_at?: string
          item_id: number
          user_id: number
        }
        Update: {
          inserted_at?: string
          item_id?: number
          user_id?: number
        }
        Relationships: []
      }
      User_SavedItem: {
        Row: {
          item_id: string
          saved_at: string
          user_id: string | null
        }
        Insert: {
          item_id: string
          saved_at?: string
          user_id?: string | null
        }
        Update: {
          item_id?: string
          saved_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "User_SavedItem_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
