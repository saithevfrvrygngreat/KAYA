#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    # If runserver is called without explicit port, default to 0.0.0.0:5000 (matching Vite proxy)
    if len(sys.argv) >= 2 and sys.argv[1] == 'runserver':
        has_port = any(':' in arg or (arg.isdigit() and int(arg) > 100) for arg in sys.argv[2:])
        if not has_port:
            port = os.getenv('PORT', '5000')
            sys.argv.append(f'0.0.0.0:{port}')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()

