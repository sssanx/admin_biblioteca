export async function GET({ url }) {
  const isbn = url.searchParams.get('isbn');

  if (!isbn) {
    return new Response(JSON.stringify({ error: "ISBN no proporcionado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Usar la API de portadas de OpenLibrary (más confiable)
    const apiUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) throw new Error("Error en la API");

    const data = await response.json();
    const bookData = data[`ISBN:${isbn}`];

    if (!bookData) {
      // Intentar con Google Books como respaldo
      const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const googleData = await googleResponse.json();
      
      if (googleData.totalItems === 0) {
        return new Response(JSON.stringify({ 
          error: "Libro no encontrado en ninguna fuente" 
        }), { status: 404 });
      }

      const item = googleData.items[0].volumeInfo;
      return new Response(JSON.stringify({
        isbn: isbn,
        titulo: item.title,
        autores: item.authors || [],
        editorial: item.publisher || "Desconocida",
        anio: item.publishedDate || "Desconocido",
        portada: item.imageLinks?.thumbnail || null
      }), { status: 200 });
    }

    // Procesar datos de OpenLibrary
    const libro = {
      isbn: isbn,
      titulo: bookData.title || "Sin título",
      autores: bookData.authors?.map(a => a.name) || [],
      editorial: bookData.publishers?.[0]?.name || "Desconocida",
      anio: bookData.publish_date || "Desconocido",
      portada: bookData.cover?.medium || null
    };

    return new Response(JSON.stringify(libro), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Error al consultar: " + error.message 
    }), { 
      status: 500 
    });
  }
}