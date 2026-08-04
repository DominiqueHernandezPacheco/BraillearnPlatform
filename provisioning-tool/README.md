# Herramienta de aprovisionamiento

Prepara **una unidad de Raspberry Pi antes de entregarla a una familia** del piloto.
La usa el técnico (o tú misma), nunca la familia — por eso vive separada de `src/`
y no forma parte de la app Electron.

## Lo que SÍ hace

- Genera un `device_id` de fábrica.
- Escribe `braillearn-wifi.json` (SSID, contraseña del WiFi y el `device_id`) en
  la partición de arranque de la SD.

## Lo que NO hace (y por qué)

No registra el dispositivo a la cuenta de la familia ni llama ninguna API de
pairing. Eso ya existe y es self-service: revisa
`../../braille_translate/routers/device.py` — cuando el Raspberry prende y su
cliente llama a `POST /device/pair/request` con este `device_id`, la familia
(ya logueada en la app) lo confirma ella misma vía `/device/pair/pending` +
`/device/pair/confirm`. Meterle a esta herramienta un paso de "asignar a
familia@correo.com" hubiera duplicado algo que el backend real ya resuelve.

Pendiente (fuera del alcance de esta herramienta): el cliente que corre *en* el
Raspberry y habla el mismo protocolo WebSocket `hello`/`render`/`done` que hoy
habla el ESP8266 (ver `../../braille_translate/utils/device.py`), ya que el Pi
va a reemplazar al ESP8266 como la placa que mueve las celdas.

## Uso

```bash
cd provisioning-tool
node provision.js
```

Te pide, en orden: SSID, contraseña del WiFi, y la ruta de la partición de
arranque de la SD (por ejemplo `D:\` en Windows). Al terminar, imprime el
`device_id` generado — anótalo en la etiqueta física que le pegues a la unidad.

## Nota sobre el formato de WiFi

El archivo `braillearn-wifi.json` es un formato simplificado para el piloto.
Raspberry Pi OS usa mecanismos distintos según la versión
(`wpa_supplicant.conf` en versiones viejas, `firstrun.sh`/`custom.toml` en
Bookworm). Cuando tengan el Raspberry en mano, valida contra la imagen real que
vayan a usar, o considera usar `rpi-imager --cli` para el WiFi y deja que el
cliente que corra en el Pi lea el `device_id` de este archivo.
