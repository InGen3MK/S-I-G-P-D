<?php
// Controlador principal para manejar las acciones de usuario (registro, login, etc.)
require_once 'database.php';
require_once 'Usuarios.php';


class UsuariosController
{
    private $usuario;
    // Constructor: recibe la conexión a la base de datos y crea la instancia del modelo Usuarios
    public function __construct($db)
    {
        $this->usuario = new Usuarios($db);
    }
    public function registrarUsuario($data)
    // llama al método registrar del modelo Usuarios
    {
        return $this->usuario->registrar($data);
        // retorna el resultado del registro (éxito o error)
    }
    // Otros métodos: login, actualizar, eliminar, etc.

    // Método público para insertar un usuario de prueba directamente
    public function insertarDirecto()
    {
        return $this->usuario->insertarDirecto();
    }

    // Método para login de usuario (llama al modelo)
    public function loginUsuario($data)
    {
        return $this->usuario->login($data);
    }
}

// Manejo de la petición POST para registro
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once 'database.php';
    // require la configuración de la base de datos
    // instancia la clase Database
    $database = new Database();
    // conecta a la base de datos
    $db = $database->connect();
    if ($db) {
        $controller = new UsuariosController($db);
        // Instancia el controlador y llama la funcionalidad según el tipo de petición
        if (isset($_POST['login'])) {
            // Si es login, prepara los datos y llama al método correspondiente
            $data = [
                'nickname' => $_POST['nickname'] ?? '',
                'contraseña' => $_POST['contraseña'] ?? ''
            ];
            $resultado = $controller->loginUsuario($data);
            // llama al método loginUsuario del controlador
            echo $resultado['message'];
            // muestra el mensaje de resultado (éxito o error)
        } else if (isset($_POST['registro'])) {
            // Si es registro, prepara los datos y llama al método correspondiente
            $data = [
                'nickname' => $_POST['nickname'] ?? '',
                'gmail' => $_POST['gmail'] ?? '',
                'contraseña' => $_POST['contraseña'] ?? '',
                'confirmar' => $_POST['confirmar'] ?? ''
            ];
            $resultado = $controller->registrarUsuario($data);
            // llama al método registrarUsuario del controlador
            echo $resultado['message'];
        } else {
            // Si la acción no es reconocida, muestra mensaje de error
            echo 'Acción no reconocida.';
        }
    } else {
        // Si no se pudo conectar a la base de datos, muestra mensaje de error
        echo 'No se pudo conectar a la base de datos.';
    }
}
