const fs = require('fs');

let content = fs.readFileSync('resources/views/home_stitch.html', 'utf-8');

// Find the start and end of the product grid
const gridStartPattern = '<div class="grid grid-cols-1 md:grid-cols-3 gap-8">';
let gridStartIdx = content.indexOf(gridStartPattern);
gridStartIdx = content.indexOf('>', gridStartIdx) + 1;

let endGridIdx = content.indexOf('</section>', gridStartIdx);
endGridIdx = content.lastIndexOf('</div>', endGridIdx);

// Extract a product card to use as template
let card1Start = content.indexOf('<!-- Product Card 1 -->', gridStartIdx);
let card2Start = content.indexOf('<!-- Product Card 2 -->', gridStartIdx);

let templateCard = content.substring(card1Start, card2Start);

// Modify the template card for Blade
templateCard = templateCard.replace(/<h3 class="font-headline-md text-\[20px\] text-primary">.*?<\/h3>/s, '<h3 class="font-headline-md text-[20px] text-primary">{{ $product->name }}</h3>');

templateCard = templateCard.replace(/<span class="text-on-surface-variant font-body-md">\$.*?<\/span>/s, '<span class="text-on-surface-variant font-body-md">INR {{ number_format((float) $product->base_price, 2) }}</span>');

templateCard = templateCard.replace(/<p class="text-on-surface-variant font-body-md mb-6 line-clamp-2">.*?<\/p>/s, '<p class="text-on-surface-variant font-body-md mb-6 line-clamp-2">{{ $product->description }}</p>');

templateCard = templateCard.replace(/<button class="w-full py-3.*?>(.*?)<\/button>/s, '<a href="{{ route(\'products.customize\', $product) }}" class="w-full py-3 rounded-lg border-[1.5px] border-primary-container dark:border-stone-300 text-primary-container dark:text-stone-200 font-semibold hover:bg-primary-container dark:hover:bg-white hover:text-white dark:hover:text-stone-950 transition-all flex justify-center items-center gap-2">$1</a>');

// Add dynamic image support using an array
const imageUrls = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDT-xzIZ280s1b-Vc2KBrhuitoYKB81tBUn_tz6WZuKQOr4HwCXBvS9MvT2VjkBaJqPpl20_sKE6NYAmeyO4M1rKSUFeoCjf15gIwaJc0Tsrj39ytUI9YwtwzH03PAtkIWFWFTmPjGKihPmCtk-MKQNRE0LPZuSKZzca8ioGKB0dX59z4Rlgsf2dI34XRuEOk2EHDKukJ0DRqlz3GKZnqw_uRvm-5ziEkBNwNj66ZW9umYwwjyHfWhp-7gs9bKtPsKQiqyTIdSbFshH",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBNWunAv-PMdnbx-I_JlA-cnHQeDz-HlXtYRdyyTl1OU01iAKBFUBLDVZJdiRMOwKGXZGH78ToynznwYbZ09cswZTdkypJ5iM94BVbhVDoEWTvDlTyxfAeZz7KRvpLfAsPK7Cdx_2Ugh7bb_4UteTKI6D5dcbQtwVBnz9PHTDRKDpfAHq6kSl2dVECJBd0mAd_nkrFlbYVqjAiDSSqEQ-KozTnw3lCHlKU3oEt4mD0zz8vRco_DURDEzrgokQS2N20Ewe561M-l5kkb",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC2Q9ZNTPmIk21KctABgfO4y4r05hzYL9B9Dy5lELaApwDhIsIRzJiguFwA5_val9Sna8gt5WFcOD1p3wR_HDSHoA9O3NQkhH9CaLGli2ULXMmUqGtd6HpS8JSlD4cuauvRTrJlp8YICQ5s_LzR0h8Rt-k4bHHpsKguLOAgYqiGMfVWV-Jia4_eHpbJgB-dj_uUT1plzLuNGU-jcyKingBEjWySLW7sv4BgdQL03pYmYLTlfHoDpMf5bOeNhY6RH9gMiBL1WhxmKOVi"
];

const phpArray = "['" + imageUrls.join("', '") + "']";
templateCard = templateCard.replace(/<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/, 
    `@php $images = ${phpArray}; @endphp\n<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="{{ $images[$loop->index % 3] }}"`);

// Remove the original src
templateCard = templateCard.replace(/src="https:\/\/[^"]+"/g, '');

// Remove the original data-alt to make it cleaner
templateCard = templateCard.replace(/data-alt="[^"]+"/g, '');

const bladeLoop = `\n@forelse ($products as $product)\n${templateCard}\n@empty\n<div class='col-span-full text-center py-10'><h3 class='text-xl font-bold mb-2'>No products found</h3><p>Run database seeding to load sample products.</p></div>\n@endforelse\n`;

const newContent = content.substring(0, gridStartIdx) + bladeLoop + content.substring(endGridIdx);

fs.writeFileSync('resources/views/home.blade.php', newContent, 'utf-8');
console.log("Done replacing HTML with Blade!");
