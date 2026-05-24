<?php

// 1. Setup SQLite database in writable /tmp directory
$dbPath = '/tmp/database.sqlite';
$sourceDb = __DIR__ . '/../database/database.sqlite';

if (!file_exists($dbPath)) {
    if (file_exists($sourceDb)) {
        copy($sourceDb, $dbPath);
    } else {
        touch($dbPath);
    }
}

// 2. Inject Vercel-compatible environment variables for serverless execution
$vercelEnv = [
    'DB_DATABASE' => $dbPath,
    'LOG_CHANNEL' => 'stderr',
    'CACHE_STORE' => 'array',
    'SESSION_DRIVER' => 'cookie',
    'VIEW_COMPILED_PATH' => '/tmp',
];

foreach ($vercelEnv as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

// Forward Vercel requests to Laravel's public/index.php
require __DIR__ . '/../public/index.php';
