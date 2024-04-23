export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      Category: {
        Row: {
          _id: string
          created_at: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          _id?: string
          created_at?: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          _id?: string
          created_at?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_Category_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      Category_Feed: {
        Row: {
          category_id: string | null
          created_at: string
          feed_id: string | null
          id: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          feed_id?: string | null
          id?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          feed_id?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_Category_Feed_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["_id"]
          },
          {
            foreignKeyName: "public_Category_Feed_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "Feed"
            referencedColumns: ["_id"]
          }
        ]
      }
      Category_Item: {
        Row: {
          category_id: string | null
          created_at: string
          id: number
          item_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: number
          item_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: number
          item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_Category_Item_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["_id"]
          },
          {
            foreignKeyName: "public_Category_Item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "Item"
            referencedColumns: ["_id"]
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
      Newsletter: {
        Row: {
          _id: string
          color: string | null
          description: string | null
          favicon_size: string | null
          favicon_url: string | null
          last_accessed: string | null
          root_url: string | null
          title: string
        }
        Insert: {
          _id: string
          color?: string | null
          description?: string | null
          favicon_size?: string | null
          favicon_url?: string | null
          last_accessed?: string | null
          root_url?: string | null
          title: string
        }
        Update: {
          _id?: string
          color?: string | null
          description?: string | null
          favicon_size?: string | null
          favicon_url?: string | null
          last_accessed?: string | null
          root_url?: string | null
          title?: string
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
      User_Newsletter: {
        Row: {
          created_at: string | null
          newsletter_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          newsletter_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          newsletter_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_User_Newsletter_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "Newsletter"
            referencedColumns: ["_id"]
          },
          {
            foreignKeyName: "public_User_Newsletter_user_id_fkey"
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
