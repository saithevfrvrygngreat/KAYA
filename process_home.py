import re

with open('resources/views/home_stitch.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start and end of the product grid
grid_start_idx = content.find('<div class="grid grid-cols-1 md:grid-cols-3 gap-8">')
grid_start_idx = content.find('>', grid_start_idx) + 1

end_grid_idx = content.find('</section>', grid_start_idx)
end_grid_idx = content.rfind('</div>', grid_start_idx, end_grid_idx)

# Extract a product card to use as template
card1_start = content.find('<!-- Product Card 1 -->', grid_start_idx)
card2_start = content.find('<!-- Product Card 2 -->', grid_start_idx)

template_card = content[card1_start:card2_start]

# Modify the template card for Blade
template_card = re.sub(r'<h3 class="font-headline-md text-\[20px\] text-primary">.*?</h3>', r'<h3 class="font-headline-md text-[20px] text-primary">{{ $product->name }}</h3>', template_card)

template_card = re.sub(r'<span class="text-on-surface-variant font-body-md">\$.*?</span>', r'<span class="text-on-surface-variant font-body-md">INR {{ number_format((float) $product->base_price, 2) }}</span>', template_card)

template_card = re.sub(r'<p class="text-on-surface-variant font-body-md mb-6 line-clamp-2">.*?</p>', r'<p class="text-on-surface-variant font-body-md mb-6 line-clamp-2">{{ $product->description }}</p>', template_card, flags=re.DOTALL)

template_card = re.sub(r'<button class="w-full py-3.*?>(.*?)</button>', r'<a href="{{ route(\'products.customize\', $product) }}" class="w-full py-3 rounded-lg border-[1.5px] border-primary-container dark:border-stone-300 text-primary-container dark:text-stone-200 font-semibold hover:bg-primary-container dark:hover:bg-white hover:text-white dark:hover:text-stone-950 transition-all flex justify-center items-center gap-2">\1</a>', template_card, flags=re.DOTALL)

# Add dynamic image support using an array
image_urls = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDT-xzIZ280s1b-Vc2KBrhuitoYKB81tBUn_tz6WZuKQOr4HwCXBvS9MvT2VjkBaJqPpl20_sKE6NYAmeyO4M1rKSUFeoCjf15gIwaJc0Tsrj39ytUI9YwtwzH03PAtkIWFWFTmPjGKihPmCtk-MKQNRE0LPZuSKZzca8ioGKB0dX59z4Rlgsf2dI34XRuEOk2EHDKukJ0DRqlz3GKZnqw_uRvm-5ziEkBNwNj66ZW9umYwwjyHfWhp-7gs9bKtPsKQiqyTIdSbFshH",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBNWunAv-PMdnbx-I_JlA-cnHQeDz-HlXtYRdyyTl1OU01iAKBFUBLDVZJdiRMOwKGXZGH78ToynznwYbZ09cswZTdkypJ5iM94BVbhVDoEWTvDlTyxfAeZz7KRvpLfAsPK7Cdx_2Ugh7bb_4UteTKI6D5dcbQtwVBnz9PHTDRKDpfAHq6kSl2dVECJBd0mAd_nkrFlbYVqjAiDSSqEQ-KozTnw3lCHlKU3oEt4mD0zz8vRco_DURDEzrgokQS2N20Ewe561M-l5kkb",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC2Q9ZNTPmIk21KctABgfO4y4r05hzYL9B9Dy5lELaApwDhIsIRzJiguFwA5_val9Sna8gt5WFcOD1p3wR_HDSHoA9O3NQkhH9CaLGli2ULXMmUqGtd6HpS8JSlD4cuauvRTrJlp8YICQ5s_LzR0h8Rt-k4bHHpsKguLOAgYqiGMfVWV-Jia4_eHpbJgB-dj_uUT1plzLuNGU-jcyKingBEjWySLW7sv4BgdQL03pYmYLTlfHoDpMf5bOeNhY6RH9gMiBL1WhxmKOVi"
]

php_array = "['" + "', '".join(image_urls) + "']"
template_card = re.sub(r'<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"', 
    f'@php $images = {php_array}; @endphp\n<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="{{{{ $images[$loop->index % 3] }}}}"', template_card)

# Remove the original src
template_card = re.sub(r'src="https://[^"]+"', '', template_card)

# Remove the original data-alt to make it cleaner
template_card = re.sub(r'data-alt="[^"]+"', '', template_card)

blade_loop = f"\n@forelse ($products as $product)\n{template_card}\n@empty\n<div class='col-span-full text-center py-10'><h3 class='text-xl font-bold mb-2'>No products found</h3><p>Run database seeding to load sample products.</p></div>\n@endforelse\n"

new_content = content[:grid_start_idx] + blade_loop + content[end_grid_idx:]

with open('resources/views/home.blade.php', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done replacing HTML with Blade!")
