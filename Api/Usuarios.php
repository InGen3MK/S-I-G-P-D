<?php
// Modelo principal para interactuar con la tabla 'usuarios' de la base de datos
class Usuarios
{
    // Propiedad privada para almacenar la conexión a la base de datos
    private $conn;
    // Propiedad privada que contiene el nombre de la tabla a usar
    private $table = "usuarios";

    // El constructor recibe una conexión a la base de datos y la guarda en la propiedad $conn
    public function __construct($db)
    {
        // Guarda la conexión recibida en la propiedad $conn
        $this->conn = $db;
    }

    // Método para login de usuario
    public function login($data)
    {
        // Verifica que los datos necesarios estén presentes
        if (!isset($data['nickname'], $data['contraseña'])) {
            return ['success' => false, 'message' => 'Faltan datos para el login.'];
        }
        $nickname = $data['nickname'];
        $contraseña = $data['contraseña'];
        // Consulta SQL para buscar el usuario por nickname y contraseña
        $query = "SELECT id_usuario FROM {$this->table} WHERE nickname = :nickname AND contraseña = :contrasena";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nickname', $nickname, PDO::PARAM_STR);
        $stmt->bindParam(':contrasena', $contraseña, PDO::PARAM_STR);
        // bindParam asocia los valores a los marcadores de la consulta preparada
        //PDO: :PARAM_STR indica que el parámetro es una cadena de texto
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        // PDO: :FETCH_ASSOC obtiene el resultado como un array asociativo
        // Si existe el usuario, login exitoso
        if ($usuario) {
            return ['success' => true, 'message' => 'Bienvenido, ' . $nickname . '!'];
            // si existe el usuario retorna mensaje de bienvenida
        } else {
            // Si no existe, login fallido
            return ['success' => false, 'message' => 'Usuario o contraseña incorrectos.'];
        }
    }

    // Método de prueba para inserción directa (no se usa)
    public function insertarDirecto()
    {
        // Inserta un usuario de prueba directamente en la base de datos
        $query = "INSERT INTO {$this->table} (nickname, gmail, contraseña) VALUES ('prueba', 'prueba@correo.com', 'clave123')";
        try {
            $stmt = $this->conn->prepare($query);
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Usuario de prueba insertado correctamente.'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()];
        }
        return ['success' => false, 'message' => 'Error al insertar usuario de prueba.'];
    }

    // Método para registrar un usuario
    public function registrar($data)
    {
        // Validar que los campos sean string
        if (!is_string($data['nickname']) || !is_string($data['gmail']) || !is_string($data['contraseña']) || !is_string($data['confirmar'])) {
            return ['success' => false, 'message' => 'Todos los campos deben ser texto.'];
        }
        // Validar que todos los campos obligatorios estén presentes
        if (!isset($data['nickname'], $data['gmail'], $data['contraseña'], $data['confirmar'])) {
            // isset verifica que las variables estén definidas y no sean null
            return ['success' => false, 'message' => 'Faltan datos requeridos para el registro.'];
        }
        if (empty($data['nickname']) || empty($data['gmail']) || empty($data['contraseña']) || empty($data['confirmar'])) {
            return ['success' => false, 'message' => 'Todos los campos son obligatorios.'];
        }
        // Validar formato de correo
        if (!filter_var($data['gmail'], FILTER_VALIDATE_EMAIL)) {
            // filter_var verifica que el correo tenga un formato válido
            return ['success' => false, 'message' => 'El correo electrónico no es válido.'];
        }
        // Validar longitud de contraseña
        if (strlen($data['contraseña']) < 6) {
            return ['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres.'];
        }
        // Validar coincidencia de contraseñas
        if ($data['contraseña'] !== $data['confirmar']) {
            return ['success' => false, 'message' => 'Las contraseñas no coinciden.'];
        }
        // Verificar si el correo o nickname ya existen en una sola consulta
        $query = "SELECT gmail, nickname FROM {$this->table} WHERE gmail = :gmail OR nickname = :nickname";
        $stmt = $this->conn->prepare($query);
        // prepara la consulta para evitar inyecciones SQL
        $stmt->bindParam(":gmail", $data['gmail'], PDO::PARAM_STR);
        $stmt->bindParam(":nickname", $data['nickname'], PDO::PARAM_STR);
        // bindParam asocia los valores a los marcadores de la consulta preparada
        $stmt->execute();
        $existe = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existe) {
            if ($existe['gmail'] === $data['gmail']) {
                return ['success' => false, 'message' => 'El correo ya está registrado.'];
                // si el correo ya existe retorna mensaje de error
            }
            if ($existe['nickname'] === $data['nickname']) {
                return ['success' => false, 'message' => 'El nombre de usuario ya está registrado.'];
            }
        }
        // Insertar usuario
        $query = "INSERT INTO usuarios (nickname, gmail, contraseña) VALUES (:nickname, :gmail, :contrasena)";
        $stmt = $this->conn->prepare($query);
        try {
            $stmt->bindParam(':nickname', $data['nickname'], PDO::PARAM_STR);
            $stmt->bindParam(':gmail', $data['gmail'], PDO::PARAM_STR);
            $stmt->bindParam(':contrasena', $data['contraseña'], PDO::PARAM_STR);
            // bindParam asocia los valores a los marcadores de la consulta preparada
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Usuario registrado correctamente.'];
                // si se inserta correctamente retorna mensaje de éxito
            }
        } catch (PDOException $e) {
            // Captura errores de SQL
            return ['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()];
            // $e contiene el mensaje de error generado por PDO
            // se puede registrar el error en un log para análisis posterior
        }
        return ['success' => false, 'message' => 'Error al registrar usuario.'];
    }

    // Método para obtener todos los registros de animales de la base de datos
    public function getAll()
    {
        // Creamos la consulta SQL para seleccionar los campos deseados de la tabla 'animales'
        $query = "SELECT id_usuario, nickname, contraseña, gmail FROM {$this->table}";
        // Preparamos la consulta usando la conexión a la base de datos para evitar inyecciones SQL
        $stmt = $this->conn->prepare($query);
        // Ejecutamos la consulta preparada
        $stmt->execute();
        // Obtenemos todos los resultados como un array asociativo y lo devolvemos
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Método para obtener un animal específico por su ID
    public function getByName($nickname)
    {
        // Creamos la consulta SQL con un marcador de posición para el ID
        $query = "SELECT id_usuario,nickname,contraseña FROM {$this->table} WHERE nickname = :nickname";
        // Preparamos la consulta usando la conexión a la base de datos
        $stmt = $this->conn->prepare($query);
        // Asociamos el valor recibido en $id al marcador ':id' en la consulta, asegurando que sea un entero
        $stmt->bindParam(":nickname", $nickname, PDO::PARAM_STR);
        // Ejecutamos la consulta preparada
        $stmt->execute();
        // Obtenemos el resultado como un array asociativo (solo un registro) y lo devolvemos
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}