export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      budget_settings: {
        Row: {
          user_id: string;
          protected_buffer: number;
          default_daily_budget: number;
          rollover_enabled: boolean;
          default_currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          protected_buffer?: number;
          default_daily_budget?: number;
          rollover_enabled?: boolean;
          default_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          protected_buffer?: number;
          default_daily_budget?: number;
          rollover_enabled?: boolean;
          default_currency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      financial_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider: "manual" | "plaid";
          external_account_id: string | null;
          provider_item_id: string | null;
          institution_name: string | null;
          official_name: string | null;
          display_name: string;
          mask: string | null;
          account_type: string | null;
          account_subtype: string | null;
          currency_code: string;
          current_balance: number | null;
          available_balance: number | null;
          account_status: "active" | "inactive" | "disconnected";
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: "manual" | "plaid";
          external_account_id?: string | null;
          provider_item_id?: string | null;
          institution_name?: string | null;
          official_name?: string | null;
          display_name: string;
          mask?: string | null;
          account_type?: string | null;
          account_subtype?: string | null;
          currency_code?: string;
          current_balance?: number | null;
          available_balance?: number | null;
          account_status?: "active" | "inactive" | "disconnected";
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider?: "manual" | "plaid";
          external_account_id?: string | null;
          provider_item_id?: string | null;
          institution_name?: string | null;
          official_name?: string | null;
          display_name?: string;
          mask?: string | null;
          account_type?: string | null;
          account_subtype?: string | null;
          currency_code?: string;
          current_balance?: number | null;
          available_balance?: number | null;
          account_status?: "active" | "inactive" | "disconnected";
          last_synced_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ledger_transactions: {
        Row: {
          id: string;
          user_id: string;
          financial_account_id: string | null;
          source: "manual" | "plaid";
          external_transaction_id: string | null;
          amount: number;
          currency_code: string;
          merchant_name: string | null;
          description: string | null;
          posted_on: string;
          authorized_at: string | null;
          pending: boolean;
          pending_external_transaction_id: string | null;
          category_labels: string[];
          user_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          financial_account_id?: string | null;
          source: "manual" | "plaid";
          external_transaction_id?: string | null;
          amount: number;
          currency_code?: string;
          merchant_name?: string | null;
          description?: string | null;
          posted_on: string;
          authorized_at?: string | null;
          pending?: boolean;
          pending_external_transaction_id?: string | null;
          category_labels?: string[];
          user_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          financial_account_id?: string | null;
          source?: "manual" | "plaid";
          external_transaction_id?: string | null;
          amount?: number;
          currency_code?: string;
          merchant_name?: string | null;
          description?: string | null;
          posted_on?: string;
          authorized_at?: string | null;
          pending?: boolean;
          pending_external_transaction_id?: string | null;
          category_labels?: string[];
          user_note?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      budget_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          starts_on: string;
          ends_on: string;
          target_amount: number;
          status: "active" | "completed" | "archived" | "cancelled";
          is_shared: boolean;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          notes?: string | null;
          starts_on: string;
          ends_on: string;
          target_amount: number;
          status?: "active" | "completed" | "archived" | "cancelled";
          is_shared?: boolean;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: {
          title?: string;
          notes?: string | null;
          starts_on?: string;
          ends_on?: string;
          target_amount?: number;
          status?: "active" | "completed" | "archived" | "cancelled";
          is_shared?: boolean;
          updated_at?: string;
          archived_at?: string | null;
        };
        Relationships: [];
      };
      event_transaction_assignments: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          ledger_transaction_id: string;
          assignment_source: "manual" | "suggested";
          review_status: "pending" | "confirmed" | "rejected";
          confidence_score: number | null;
          is_ambiguous: boolean;
          rationale: Json;
          assignment_note: string | null;
          created_at: string;
          updated_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          ledger_transaction_id: string;
          assignment_source: "manual" | "suggested";
          review_status?: "pending" | "confirmed" | "rejected";
          confidence_score?: number | null;
          is_ambiguous?: boolean;
          rationale?: Json;
          assignment_note?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          event_id?: string;
          ledger_transaction_id?: string;
          assignment_source?: "manual" | "suggested";
          review_status?: "pending" | "confirmed" | "rejected";
          confidence_score?: number | null;
          is_ambiguous?: boolean;
          rationale?: Json;
          assignment_note?: string | null;
          updated_at?: string;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
      transaction_splits: {
        Row: {
          id: string;
          user_id: string;
          ledger_transaction_id: string;
          event_id: string | null;
          split_amount: number;
          split_kind: "event" | "shared" | "manual_adjustment";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ledger_transaction_id: string;
          event_id?: string | null;
          split_amount: number;
          split_kind?: "event" | "shared" | "manual_adjustment";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          ledger_transaction_id?: string;
          event_id?: string | null;
          split_amount?: number;
          split_kind?: "event" | "shared" | "manual_adjustment";
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      plaid_items: {
        Row: {
          id: string;
          user_id: string;
          plaid_item_id: string;
          access_token: string;
          institution_id: string | null;
          institution_name: string | null;
          available_products: string[];
          billed_products: string[];
          products: string[];
          item_status: "active" | "needs_attention" | "revoked";
          error_code: string | null;
          error_type: string | null;
          error_message: string | null;
          consent_expires_at: string | null;
          transactions_cursor: string | null;
          last_transactions_sync_started_at: string | null;
          last_transactions_sync_completed_at: string | null;
          last_transactions_sync_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plaid_item_id: string;
          access_token: string;
          institution_id?: string | null;
          institution_name?: string | null;
          available_products?: string[];
          billed_products?: string[];
          products?: string[];
          item_status?: "active" | "needs_attention" | "revoked";
          error_code?: string | null;
          error_type?: string | null;
          error_message?: string | null;
          consent_expires_at?: string | null;
          transactions_cursor?: string | null;
          last_transactions_sync_started_at?: string | null;
          last_transactions_sync_completed_at?: string | null;
          last_transactions_sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plaid_item_id?: string;
          access_token?: string;
          institution_id?: string | null;
          institution_name?: string | null;
          available_products?: string[];
          billed_products?: string[];
          products?: string[];
          item_status?: "active" | "needs_attention" | "revoked";
          error_code?: string | null;
          error_type?: string | null;
          error_message?: string | null;
          consent_expires_at?: string | null;
          transactions_cursor?: string | null;
          last_transactions_sync_started_at?: string | null;
          last_transactions_sync_completed_at?: string | null;
          last_transactions_sync_error?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      function_rate_limit_windows: {
        Row: {
          function_name: string;
          scope_key: string;
          window_started_at: string;
          request_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          function_name: string;
          scope_key: string;
          window_started_at: string;
          request_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          request_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
