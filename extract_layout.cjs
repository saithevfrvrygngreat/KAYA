const fs = require('fs');
const path = require('path');

const homeContent = fs.readFileSync('resources/views/home.blade.php', 'utf-8');

// The main content starts at <main> and ends at </main>
const mainStart = homeContent.indexOf('<main>');
const mainEnd = homeContent.indexOf('</main>') + 7;

let header = homeContent.substring(0, mainStart);
let footer = homeContent.substring(mainEnd);
let mainContent = homeContent.substring(mainStart + 6, mainEnd - 7);

// Update navbar links with active states
header = header.replace(
    /<a class="text-emerald-900.*?>Home<\/a>/,
    `<a class="{{ request()->routeIs('home') ? 'text-emerald-900 dark:text-emerald-400 font-semibold border-b-2 border-emerald-900 dark:border-emerald-400 pb-1' : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors' }}" href="{{ route('home') }}">Home</a>`
);

header = header.replace(
    /<a class="text-stone-500.*?>Products<\/a>/,
    `<a class="{{ request()->routeIs('products.index') ? 'text-emerald-900 dark:text-emerald-400 font-semibold border-b-2 border-emerald-900 dark:border-emerald-400 pb-1' : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors' }}" href="{{ route('products.index') }}">Products</a>`
);

header = header.replace(
    /<a class="text-stone-500.*?>Customize<\/a>/,
    `<a class="{{ request()->routeIs('customize.index') ? 'text-emerald-900 dark:text-emerald-400 font-semibold border-b-2 border-emerald-900 dark:border-emerald-400 pb-1' : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors' }}" href="{{ route('customize.index') }}">Customize</a>`
);

// Update buttons
header = header.replace(
    /<button class="px-5 py-2 text-sm font-semibold text-stone-500 hover:text-emerald-800 transition-colors">Login<\/button>/,
    `<a href="{{ route('login') }}" class="px-5 py-2 text-sm font-semibold text-stone-500 hover:text-emerald-800 transition-colors">Login</a>`
);

header = header.replace(
    /<button class="bg-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity">Sign Up<\/button>/,
    `<a href="{{ route('register') }}" class="bg-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity">Sign Up</a>`
);

const layoutContent = `${header}\n<main class="min-h-screen">\n    @yield('content')\n</main>\n${footer}`;

const layoutsDir = path.join('resources', 'views', 'layouts');
if (!fs.existsSync(layoutsDir)) {
    fs.mkdirSync(layoutsDir, { recursive: true });
}

fs.writeFileSync(path.join(layoutsDir, 'app.blade.php'), layoutContent, 'utf-8');

const newHomeContent = `@extends('layouts.app')\n\n@section('content')\n${mainContent}\n@endsection\n`;
fs.writeFileSync('resources/views/home.blade.php', newHomeContent, 'utf-8');

console.log("Layout extracted and home updated successfully!");
