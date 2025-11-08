<?php
require_once 'database.php'; // incluir la definición de la clase Database y la conexión



// Enviar cabecera indicando que la respuesta será JSON en UTF-8
header('Content-Type: application/json; charset=utf-8');

try {
    $database = new Database();               // crear instancia del helper de BD
    $db = $database->connect();               // obtener la conexión PDO (o false si falla)
    
    if ($db) {
        // Preparar la consulta: obtener los 5 mejores (ganador y puntuación)
        $query = "SELECT ganador, puntuacion FROM partida ORDER BY puntuacion DESC LIMIT 5";
        $stmt = $db->prepare($query);         // preparar la sentencia SQL
        $stmt->execute();                     // ejecutar la consulta
        
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC); // traer todos los resultados como array asociativo
        
        // Si no hay resultados, devolver un array vacío (no insertamos datos automáticamente)
        if (empty($resultados)) {
            $resultados = [];
        }
        
        // Devolver los resultados en formato JSON (puede ser array vacío si no hay filas)
        echo json_encode($resultados);
    } else {
        // Si la conexión a la base de datos falló, devolver un JSON con el error
        echo json_encode([
            'error' => true,
            'message' => 'Error de conexión a la base de datos'
        ]);
    }
} catch (Exception $e) {
    // En caso de excepción, devolver información del error en JSON (útil en desarrollo)
    echo json_encode([
        'error' => true,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>