@extends('layouts.app')

@section('content')
<!-- Full screen background wrapper -->
<div class="min-h-[80vh] flex items-center justify-center relative py-12 bg-stone-900" style="background-image: url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80'); background-size: cover; background-position: center;">
    
    <!-- Dark overlay for better readability -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

    <div class="relative w-full max-w-md mx-auto px-6">
        <!-- Glassmorphism Card -->
        <div class="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
            
            <div class="text-center mb-8">
                <h2 class="font-headline-lg text-white text-3xl mb-2">Create Account</h2>
                <p class="text-white/80 font-body-md">Join us to start personalizing your space.</p>
            </div>
            
            <form action="{{ route('register') }}" method="POST" class="space-y-5">
                @csrf
                <div>
                    <label class="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">Full Name</label>
                    <input type="text" name="name" value="{{ old('name') }}" class="w-full bg-white/20 border @error('name') border-rose-400 @else border-white/10 @enderror px-5 py-3 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50" placeholder="Enter your full name" required autofocus>
                    @error('name')
                        <span class="text-xs text-rose-300 mt-1 block font-semibold">{{ $message }}</span>
                    @enderror
                </div>

                <div>
                    <label class="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">Email Address</label>
                    <input type="email" name="email" value="{{ old('email') }}" class="w-full bg-white/20 border @error('email') border-rose-400 @else border-white/10 @enderror px-5 py-3 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50" placeholder="Enter your email" required>
                    @error('email')
                        <span class="text-xs text-rose-300 mt-1 block font-semibold">{{ $message }}</span>
                    @enderror
                </div>
                
                <div>
                    <label class="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">Password</label>
                    <div class="relative">
                        <input type="password" name="password" id="registerPassword" class="w-full bg-white/20 border @error('password') border-rose-400 @else border-white/10 @enderror pl-5 pr-12 py-3 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50" placeholder="Create a strong password" required oninput="checkPasswordStrength(this.value)">
                        <button type="button" onclick="togglePasswordVisibility('registerPassword', this)" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                    </div>
                    @error('password')
                        <span class="text-xs text-rose-300 mt-1 block font-semibold">{{ $message }}</span>
                    @enderror
                    {{-- Live password strength checker --}}
                    <div id="passwordStrength" class="mt-3 space-y-1.5 hidden">
                        <p class="text-xs text-white/60 uppercase tracking-widest mb-2">Password must contain:</p>
                        <div class="flex items-center gap-2" id="rule-length">
                            <span class="material-symbols-outlined text-[16px] text-white/30 transition-colors" id="icon-length">radio_button_unchecked</span>
                            <span class="text-xs text-white/50 transition-colors" id="text-length">At least 8 characters</span>
                        </div>
                        <div class="flex items-center gap-2" id="rule-upper">
                            <span class="material-symbols-outlined text-[16px] text-white/30 transition-colors" id="icon-upper">radio_button_unchecked</span>
                            <span class="text-xs text-white/50 transition-colors" id="text-upper">One uppercase letter (A–Z)</span>
                        </div>
                        <div class="flex items-center gap-2" id="rule-lower">
                            <span class="material-symbols-outlined text-[16px] text-white/30 transition-colors" id="icon-lower">radio_button_unchecked</span>
                            <span class="text-xs text-white/50 transition-colors" id="text-lower">One lowercase letter (a–z)</span>
                        </div>
                        <div class="flex items-center gap-2" id="rule-number">
                            <span class="material-symbols-outlined text-[16px] text-white/30 transition-colors" id="icon-number">radio_button_unchecked</span>
                            <span class="text-xs text-white/50 transition-colors" id="text-number">One number (0–9)</span>
                        </div>
                        <div class="flex items-center gap-2" id="rule-symbol">
                            <span class="material-symbols-outlined text-[16px] text-white/30 transition-colors" id="icon-symbol">radio_button_unchecked</span>
                            <span class="text-xs text-white/50 transition-colors" id="text-symbol">One special character (!@#$…)</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">Confirm Password</label>
                    <div class="relative">
                        <input type="password" name="password_confirmation" id="registerConfirmPassword" class="w-full bg-white/20 border border-white/10 pl-5 pr-12 py-3 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50" placeholder="Confirm your password" required>
                        <button type="button" onclick="togglePasswordVisibility('registerConfirmPassword', this)" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                    </div>
                </div>
                
                <button type="submit" class="w-full bg-emerald-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-emerald-800 shadow-[0_0_20px_rgba(6,78,59,0.4)] transition-all flex justify-center items-center gap-2 mt-4">
                    Create Account
                    <span class="material-symbols-outlined text-[20px]">person_add</span>
                </button>
            </form>
            
            <p class="text-center mt-8 text-white/80 text-sm">
                Already have an account? 
                <a href="{{ route('login') }}" class="text-white font-semibold hover:text-emerald-300 transition-colors">Sign in here</a>
            </p>
        </div>
    </div>
</div>

<script>
    function togglePasswordVisibility(fieldId, btn) {
        const input = document.getElementById(fieldId);
        const icon = btn.querySelector('.material-symbols-outlined');
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility';
        }
    }

    function checkPasswordStrength(value) {
        const panel = document.getElementById('passwordStrength');
        panel.classList.toggle('hidden', value.length === 0);

        const rules = [
            { id: 'length', test: value.length >= 8 },
            { id: 'upper',  test: /[A-Z]/.test(value) },
            { id: 'lower',  test: /[a-z]/.test(value) },
            { id: 'number', test: /[0-9]/.test(value) },
            { id: 'symbol', test: /[^A-Za-z0-9]/.test(value) },
        ];

        rules.forEach(({ id, test }) => {
            const icon = document.getElementById('icon-' + id);
            const text = document.getElementById('text-' + id);
            if (test) {
                icon.textContent = 'check_circle';
                icon.classList.replace('text-white/30', 'text-emerald-400');
                text.classList.replace('text-white/50', 'text-emerald-300');
            } else {
                icon.textContent = 'radio_button_unchecked';
                if (!icon.classList.contains('text-white/30')) {
                    icon.classList.replace('text-emerald-400', 'text-white/30');
                    text.classList.replace('text-emerald-300', 'text-white/50');
                }
            }
        });
    }
</script>
@endsection
