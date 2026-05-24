<?php

// 1. Setup SQLite database in writable /tmp directory
$dbPath = '/tmp/database.sqlite';
$sourceDb = __DIR__ . '/../database/database.sqlite';

error_log("Vercel Boot: Checking SQLite database...");
error_log("Source DB path: " . $sourceDb . " (Exists: " . (file_exists($sourceDb) ? "YES, size: " . filesize($sourceDb) : "NO") . ")");

if (!file_exists($dbPath)) {
    if (file_exists($sourceDb)) {
        if (copy($sourceDb, $dbPath)) {
            error_log("Successfully copied database to " . $dbPath . " (Size: " . filesize($dbPath) . ")");
        } else {
            error_log("Failed to copy database to " . $dbPath);
            touch($dbPath);
        }
    } else {
        error_log("Source database not found! Creating empty SQLite database at " . $dbPath);
        touch($dbPath);
    }
} else {
    error_log("Database already exists at " . $dbPath . " (Size: " . filesize($dbPath) . ")");
}

// 2. Inject Vercel-compatible environment variables for serverless execution
$vercelEnv = [
    'DB_DATABASE' => $dbPath,
    'LOG_CHANNEL' => 'stderr',
    'CACHE_STORE' => 'array',
    'SESSION_DRIVER' => 'cookie',
    'VIEW_COMPILED_PATH' => '/tmp',
    'APP_DEBUG' => 'true', // Force debug mode to show exact errors in browser/logs
];

foreach ($vercelEnv as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

try {
    // Forward Vercel requests to Laravel's public/index.php
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    header('Content-Type: text/plain');
    echo "CRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    error_log("CRITICAL ERROR: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    exit(1);
}

