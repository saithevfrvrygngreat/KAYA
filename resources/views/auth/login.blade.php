@extends('layouts.app')

@section('content')
<!-- Full screen background wrapper -->
<div class="min-h-[80vh] flex items-center justify-center relative py-20 bg-stone-900" style="background-image: url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80'); background-size: cover; background-position: center;">
    
    <!-- Dark overlay for better readability -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

    <div class="relative w-full max-w-md mx-auto px-6">
        <!-- Glassmorphism Card -->
        <div class="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
            
            <div class="text-center mb-8">
                <h2 class="font-headline-lg text-white text-3xl mb-2">Welcome Back</h2>
                <p class="text-white/80 font-body-md">Sign in to continue your journey.</p>
            </div>
            
            <form action="{{ route('login') }}" method="POST" class="space-y-6">
                @csrf
                <div>
                    <label class="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">Email Address</label>
                    <input type="email" name="email" value="{{ old('email') }}" class="w-full bg-white/20 border @error('email') border-rose-400 @else border-white/10 @enderror px-5 py-4 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50" placeholder="Enter your email" required autofocus>
                    @error('email')
                        <span class="text-xs text-rose-300 mt-1 block font-semibold">{{ $message }}</span>
                    @enderror
                </div>
                
                <div>
                    <label class="block font-label-sm text-white/90 mb-2 uppercase tracking-widest text-xs">Password</label>
                    <div class="relative">
                        <input type="password" name="password" id="loginPassword" class="w-full bg-white/20 border @error('password') border-rose-400 @else border-white/10 @enderror pl-5 pr-12 py-4 rounded-xl focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors text-white placeholder-white/50" placeholder="Enter your password" required>
                        <button type="button" onclick="togglePasswordVisibility('loginPassword', this)" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                    </div>
                    @error('password')
                        <span class="text-xs text-rose-300 mt-1 block font-semibold">{{ $message }}</span>
                    @enderror
                </div>
                
                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="remember" class="rounded border-white/20 bg-white/10 text-emerald-800 focus:ring-emerald-800 focus:ring-offset-0">
                        <span class="text-sm text-white/90">Remember me</span>
                    </label>
                    <a href="#" class="text-sm text-white hover:text-emerald-300 font-semibold transition-colors">Forgot Password?</a>
                </div>
                
                <button type="submit" class="w-full bg-emerald-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-emerald-800 shadow-[0_0_20px_rgba(6,78,59,0.4)] transition-all flex justify-center items-center gap-2">
                    Sign In
                    <span class="material-symbols-outlined text-[20px]">login</span>
                </button>
            </form>
            
            <p class="text-center mt-8 text-white/80 text-sm">
                Don't have an account? 
                <a href="{{ route('register') }}" class="text-white font-semibold hover:text-emerald-300 transition-colors">Sign up for free</a>
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
</script>
@endsection
