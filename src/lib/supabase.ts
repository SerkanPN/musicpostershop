const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-anon-key';

interface QueryBuilder {
  select: (cols?: string) => QueryBuilder;
  insert: (values: any) => Promise<{ data: any; error: any }>;
  update: (values: any) => QueryBuilder;
  delete: () => QueryBuilder;
  eq: (col: string, val: any) => QueryBuilder;
  order: (col: string, opts?: any) => QueryBuilder;
  single: () => Promise<{ data: any; error: any }>;
  then: (resolve: (val: { data: any; error: any }) => void) => Promise<any>;
}

function createQueryBuilder(table: string): QueryBuilder {
  let isSingle = false;
  let filters: Record<string, any> = {};

  const builder: QueryBuilder = {
    select(cols = '*') {
      return builder;
    },
    async insert(values: any) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(values)
        });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    update(values: any) {
      return builder;
    },
    delete() {
      return builder;
    },
    eq(col: string, val: any) {
      filters[col] = val;
      return builder;
    },
    order(col: string, opts?: any) {
      return builder;
    },
    async single() {
      isSingle = true;
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => queryParams.append(k, `eq.${v}`));
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${queryParams.toString()}`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        const data = await res.json();
        return { data: Array.isArray(data) ? data[0] : data, error: res.ok ? null : data };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    async then(resolve) {
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => queryParams.append(k, `eq.${v}`));
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${queryParams.toString()}`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });
        const data = await res.json();
        const result = { data: Array.isArray(data) ? data : [], error: res.ok ? null : data };
        resolve(result);
        return result;
      } catch (err) {
        const result = { data: null, error: err };
        resolve(result);
        return result;
      }
    }
  };

  return builder;
}

export const supabase = {
  from(table: string) {
    return createQueryBuilder(table);
  },
  auth: {
    async getUser() {
      return { data: { user: null }, error: null };
    },
    async getSession() {
      return { data: { session: null }, error: null };
    }
  }
};
