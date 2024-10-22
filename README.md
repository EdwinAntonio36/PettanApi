# 1- Pettan API

Bienvenido a la API que gestiona una lista de cartas del exitoso videojuego Dragon Ball Z Dokkan Battle: Pettan Battle.
Contiene los siguientes metodos:
  1.    Controlador y Endpoints:

El API implementa los siguientes endpoints:

   •    POST: Crear un nuevo recurso.

   •    DELETE: Eliminar un recurso existente.

   •    GET (por ID): Obtener un recurso específico por su ID.

   •    GET (múltiples elementos): Obtener varios recursos filtrados por un campo de tu elección. Este endpoint implementa paginación desde el repositorio (base de datos), no desde la capa de servicio.

   •    PUT: Actualizar un recurso completo.

   •    PATCH: Actualizar sólo las propiedades específicas que el usuario envíe.

   2.    Cache para consultas GET:

Implementa un sistema de cache para los endpoints de GET (por ID y múltiple) usando un servicio de cache externo (Redis). 

   3.    Validaciones y códigos de estado:

Todos los controladores incluyen validaciones exhaustivas para los datos de entrada y siguen las convenciones de uso adecuado de los códigos de estado HTTP (200, 400, 404, 500, etc.).



## 2- Requisitos 

- Docker (Se puede instalar desde su pagina: https://www.docker.com/get-started)
- Docker Compose
- Node.js (Se puede descargar desde su pagina principal: https://nodejs.org/en )
- Puerto 3000 libre
- JS

## Para la instalación de la API

1. Clona este repositorio en el directorio de tu preferencia:

    git clone https://github.com/EdwinAntonio36/PettanApi.git

2. Instala las dependencias de node.js:

    npm install
    
3. Construye y levanta los contenedores usando docker-compose:

    docker-compose build

    docker-compose up -d

# Uso practico 
Una vez que los contenedores estén levantados (app-1, db-1, mongo-seed(Normalmente se levantara y se apagara) y redis-1) la API se podra usar con el siguiente enlace:

http://localhost:3000

Para verificar los endpoint y la documentación de Swagger:

http://localhost:3000/swaggerIndex

# Para detener los contenedores:
docker-compose down





