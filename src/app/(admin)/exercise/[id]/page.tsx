
export default async function Exercise({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  console.log('ID', id);
  
};
