<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Check if running in a Vercel serverless environment
        if (env('VERCEL') || isset($_SERVER['VERCEL']) || isset($_ENV['VERCEL']) || (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'vercel.app') !== false) || strpos(env('APP_URL', ''), 'vercel') !== false) {
            
            // 1. Dynamic Writable SQLite Database
            if (config('database.default') === 'sqlite') {
                $originalDb = config('database.connections.sqlite.database');
                if ($originalDb === database_path('database.sqlite')) {
                    $vercelDb = '/tmp/database.sqlite';
                    if (!file_exists($vercelDb)) {
                        if (file_exists($originalDb)) {
                            copy($originalDb, $vercelDb);
                        } else {
                            touch($vercelDb);
                        }
                    }
                    config(['database.connections.sqlite.database' => $vercelDb]);
                }
            }

            // 2. Dynamic Writable View Compiled Path
            if (!file_exists('/tmp/views')) {
                mkdir('/tmp/views', 0755, true);
            }
            config(['view.compiled' => '/tmp/views']);

            // 3. Stderr Logging to capture serverless logs
            config(['logging.default' => 'stderr']);

            // 4. Dynamic Writable File Storage Roots
            config(['filesystems.disks.local.root' => '/tmp/storage/app/private']);
            config(['filesystems.disks.public.root' => '/tmp/storage/app/public']);
        }
    }
}
