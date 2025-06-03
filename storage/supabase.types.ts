export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      Annotation: {
        Row: {
          _id: string
          created_at: string
          item_id: string | null
          last_shown: string | null
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
          last_shown?: string | null
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
          last_shown?: string | null
          note?: string | null
          serialized?: string
          text?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
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
          },
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
          },
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
          subscribe_url: string | null
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
          subscribe_url?: string | null
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
          subscribe_url?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      Item: {
        Row: {
          _id: string
          created_at: string
          feed_id: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          _id: string
          created_at?: string
          feed_id?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          _id?: string
          created_at?: string
          feed_id?: string | null
          title?: string | null
          url?: string | null
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
          subscribe_url: string | null
          title: string
          url: string | null
        }
        Insert: {
          _id: string
          color?: string | null
          description?: string | null
          favicon_size?: string | null
          favicon_url?: string | null
          last_accessed?: string | null
          subscribe_url?: string | null
          title: string
          url?: string | null
        }
        Update: {
          _id?: string
          color?: string | null
          description?: string | null
          favicon_size?: string | null
          favicon_url?: string | null
          last_accessed?: string | null
          subscribe_url?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      Profile: {
        Row: {
          code_name: string
          created_at: string
          id: string
        }
        Insert: {
          code_name: string
          created_at?: string
          id?: string
        }
        Update: {
          code_name?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      User_CodeName: {
        Row: {
          code_name: string
          user_id: string
        }
        Insert: {
          code_name: string
          user_id?: string
        }
        Update: {
          code_name?: string
          user_id?: string
        }
        Relationships: []
      }
      User_Feed: {
        Row: {
          created_at: string | null
          feed_id: string
          is_nudge_active: boolean
          next_nudge: number | null
          read_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feed_id: string
          is_nudge_active?: boolean
          next_nudge?: number | null
          read_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feed_id?: string
          is_nudge_active?: boolean
          next_nudge?: number | null
          read_count?: number | null
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
        ]
      }
      User_Newsletter: {
        Row: {
          created_at: string | null
          is_nudge_active: boolean | null
          newsletter_id: string
          next_nudge: number | null
          read_count: number | null
          unsubscribe_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          is_nudge_active?: boolean | null
          newsletter_id: string
          next_nudge?: number | null
          read_count?: number | null
          unsubscribe_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          is_nudge_active?: boolean | null
          newsletter_id?: string
          next_nudge?: number | null
          read_count?: number | null
          unsubscribe_url?: string | null
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args:
          | {
              prefix: string
              bucketname: string
              limits?: number
              levels?: number
              offsets?: number
            }
          | {
              prefix: string
              bucketname: string
              limits?: number
              levels?: number
              offsets?: number
              search?: string
              sortcolumn?: string
              sortorder?: string
            }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {},
  },
} as const
