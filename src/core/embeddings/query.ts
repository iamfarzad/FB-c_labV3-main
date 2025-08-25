import { getSupabaseStorage } from '@/src/services/storage/supabase'

export async function upsertEmbeddings(sessionId: string, kind: string, texts: string[], vectors: number[][]) {
  const supabase = getSupabaseStorage().getServiceClient()
  const rows = texts.map((t, i) => ({ session_id: sessionId, kind, text: t, embedding: vectors[i] }))
  await supabase.from('documents_embeddings').insert(rows)
}

export async function queryTopK(sessionId: string, queryVector: number[], k = 5) {
  const supabase = getSupabaseStorage().getServiceClient()
  // Note: pgvector cosine distance; requires proper index in prod
  const { data, error } = await supabase.rpc('match_documents', { p_session_id: sessionId, p_query: queryVector, p_match_count: k })
  if (error) return []
  return data || []
}


