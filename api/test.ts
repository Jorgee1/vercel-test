export const config = {
    runtime: 'edge'
}


export default async (req) => {
    return new Response(
        JSON.stringify({'test': 'THIS IS A TEST'}),
        {
            status: 200,
            headers: { 'content-type': 'application/json' }
        }
    )
}