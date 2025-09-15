<?php
require_once 'database.php';
require_once 'Usuarios.php';


class UsuariosController
{
    private $usuario;
    public function __construct($db)
    {
        $this->usuario = new Usuarios($db);
    }
    public function registrarUsuario($data)
    {
        return $this->usuario->registrar($data);
    }
    // Otros métodos: login, actualizar, eliminar, etc.

    // Método público para insertar directamente
    public function insertarDirecto()
    {
        return $this->usuario->insertarDirecto();
    }

    public function loginUsuario($data)
    {
        return $this->usuario->login($data);
    }
}

// Manejo de la petición POST para registro
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once 'database.php';
    $database = new Database();
    $db = $database->connect();
    if ($db) {
        $controller = new UsuariosController($db);
        // Si es login
        if (isset($_POST['login'])) {
            $data = [
                'nickname' => $_POST['nickname'] ?? '',
                'contraseña' => $_POST['contraseña'] ?? ''
            ];
            $resultado = $controller->loginUsuario($data);
            echo $resultado['message'];
        } else if (isset($_POST['registro'])) {
            $data = [
                'nickname' => $_POST['nickname'] ?? '',
                'gmail' => $_POST['gmail'] ?? '',
                'contraseña' => $_POST['contraseña'] ?? '',
                'confirmar' => $_POST['confirmar'] ?? ''
            ];
            $resultado = $controller->registrarUsuario($data);
            echo $resultado['message'];
        } else {
            echo 'Acción no reconocida.';
        }
    } else {
        echo 'No se pudo conectar a la base de datos.';
    }
}
