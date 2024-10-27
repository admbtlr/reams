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
          user_id: string
        }
        Insert: {
          created_at?: string | null
          is_nudge_active?: boolean | null
          newsletter_id: string
          next_nudge?: number | null
          read_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          is_nudge_active?: boolean | null
          newsletter_id?: string
          next_nudge?: number | null
          read_count?: number | null
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
      [_ in never]: never
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
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search:
        | {
            Args: {
              prefix: string
              bucketname: string
              limits?: number
              levels?: number
              offsets?: number
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
        | {
            Args: {
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
