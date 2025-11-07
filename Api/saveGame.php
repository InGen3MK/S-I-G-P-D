<?php
// Endpoint para guardar la partida. Delegamos la lógica al controlador
require_once 'database.php';
require_once 'PartidaController.php';


// Leemos el cuerpo JSON
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No JSON recibido']);
    exit;
}

$database = new Database();
$db = $database->connect();
if (!$db) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error conectando DB']);
    exit;
}

$controller = new PartidaController($db);
$resultado = $controller->guardarPartida($data);

if ($resultado['success']) {
    echo json_encode($resultado);
} else {
    http_response_code(500);
    echo json_encode($resultado);
}

?>