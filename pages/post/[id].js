export async function getServerSideProps({ params }) {
    const { data, error } = await supabase.from("posts").select("*").eq("id", params.id).single();
  
    if (error) return { notFound: true };
  
    return { props: { post: data } };
  }
  