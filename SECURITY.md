# Política de Seguridad / Security Policy

## Versiones Soportadas / Supported Versions

| Versión | Soportada          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporte de Vulnerabilidades / Reporting a Vulnerability

La seguridad del código y la privacidad de los usuarios son prioritarias en SmileGem Studio.

Si descubres o sospechas de una vulnerabilidad de seguridad en este repositorio:
1. **NO abras un issue público** detallando la vulnerabilidad.
2. Envía un correo con la descripción detallada, pasos para reproducir y posible impacto a: `diegonicolas3034@gmail.com`.
3. Recibirás acuse de recibo y evaluación dentro de las 48 horas hábiles.
4. Una vez validada y mitigada la vulnerabilidad, se publicará una versión corregida en GitHub.

### Medidas de Seguridad del Repositorio
- Todas las variables de entorno sensibles (`.env`, `.env.local`) están excluidas del control de versiones.
- Las dependencias son monitoreadas continuamente para prevenir paquetes con vulnerabilidades conocidas.
- Build automatizado sin exposición de claves privadas en clientes web.
