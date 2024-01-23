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
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      Feed: {
        Row: {
          _id: string
          color: string | null
          description: string | null
          did_error: boolean | null
          etag: string | null
          favicon_size: string | null
          favicon_url: string | null
          feedbin_id: number | null
          last_accessed: string | null
          root_url: string | null
          title: string
          url: string
        }
        Insert: {
          _id: string
          color?: string | null
          description?: string | null
          did_error?: boolean | null
          etag?: string | null
          favicon_size?: string | null
          favicon_url?: string | null
          feedbin_id?: number | null
          last_accessed?: string | null
          root_url?: string | null
          title: string
          url: string
        }
        Update: {
          _id?: string
          color?: string | null
          description?: string | null
          did_error?: boolean | null
          etag?: string | null
          favicon_size?: string | null
          favicon_url?: string | null
          feedbin_id?: number | null
          last_accessed?: string | null
          root_url?: string | null
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
          feed_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feed_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          feed_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feed_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "Feed"
            referencedColumns: ["_id"]
          },
          {
            foreignKeyName: "user_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      User_ReadItem: {
        Row: {
          created_at: string | null
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_readitem_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "Item"
            referencedColumns: ["_id"]
          },
          {
            foreignKeyName: "user_readitem_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      User_SavedItem: {
        Row: {
          id: number
          item_id: string
          saved_at: string
          user_id: string | null
        }
        Insert: {
          id?: number
          item_id: string
          saved_at?: string
          user_id?: string | null
        }
        Update: {
          id?: number
          item_id?: string
          saved_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "User_SavedItem_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "Item"
            referencedColumns: ["_id"]
          },
          {
            foreignKeyName: "User_SavedItem_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
