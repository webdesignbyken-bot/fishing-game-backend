<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Use Railway environment variable for API key
$api_key = getenv('XAI_API_KEY');
if (!$api_key) {
    http_response_code(500);
    echo json_encode(['error' => 'API key not configured']);
    exit;
}

// Enable error logging
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/tmp/php_error.log');
error_reporting(E_ALL);

// Check if curl is enabled
if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['error' => 'cURL extension is not enabled']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['numQuestions'], $input['topics'], $input['gradeLevel'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$numQuestions = $input['numQuestions'];
$topics = $input['topics'];
$gradeLevel = $input['gradeLevel'];

if ($numQuestions < 1 || $numQuestions > 50 || empty($topics)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid number of questions or topics']);
    exit;
}

$ch = curl_init('https://api.x.ai/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $api_key
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'grok-beta',
    'messages' => [[
        'role' => 'user',
        'content' => "Generate $numQuestions educational questions for grade $gradeLevel on $topics. Each question should include a question, correct answer, and difficulty (easy, medium, hard). Format as JSON array. Example: [{\"question\": \"Solve x^2 + 5x + 6 = 0\", \"answer\": \"x = -2, -3\", \"difficulty\": \"medium\"}]"
    ]],
    'max_tokens' => 1000
]));

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $http_code !== 200) {
    http_response_code($http_code);
    echo json_encode(['error' => 'Grok API request failed: ' . curl_error($ch)]);
    exit;
}

$data = json_decode($response, true);
if (!$data || !isset($data['choices'][0]['message']['content'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid Grok API response']);
    exit;
}

echo $data['choices'][0]['message']['content'];
?>