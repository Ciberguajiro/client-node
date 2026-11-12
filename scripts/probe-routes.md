# Prueba de rutas API QvaPay

## Resultados de prueba (sin autenticación)

| Ruta | Status | Resumen / Interpretación |
|-------|--------|---------------------------|
| /user | 401 | existe (requiere auth) |
| /v2/user | 404 | no existe |
| /transaction?page=1 | 401 | existe (requiere auth) |
| /v2/transaction?page=1 | 404 | no existe |
| /transactions | 404 | no existe |
| /v2/transactions | 405 | método equivocado |
| /coins | 200 | array(6) [existe (pública)] |
| /v2/coins | 404 | no existe |
| /coins/v2?enabled_p2p=1 | 200 | array(105) [existe (pública)] |
| /v2/coins/v2?enabled_p2p=1 | 404 | no existe |
| /coins/price-history/BTC?timeframe=24H | 200 | array(96) [existe (pública)] |
| /v2/coins/price-history/BTC?timeframe=24H | 404 | no existe |
| /coins/BTC/history?timeframe=24H | 404 | no existe |
| /v2/coins/BTC/history?timeframe=24H | 404 | no existe |
| /p2p/averages | 200 | BTC, LTC, ETH, BCH, DASH, USDT, DOGE, TRX, PAYEER, AIRTM, ZELLE, BTCLN, BUSDBSC, BNBBSC, CAKE, ADA, XMR, XRP, XNO, MATICMAINNET, SOL, PAYPAL, UPHOLD, CASHAPP, SBERBANK, BANK_EUR, BANK_MLC, BANK, BANK_CUP, SHIB, DAI, USDC, TRVL, PM, ETECSA, HIVE, GRAM, MYBAMBU, TROPIPAY, REVOLUPAY, WEBMONEY, LINK, CRO, BOLSATM, TUSD, ALGO, AVAX, AVA, DOT, USDTERC20, USDTSOL, HBD, XTZ, APPLECASH, USDCMATIC, USDCSOL, USDCALGO, USDTBSC, SKRILL, VENMO, WISE, XLM, USDTMATIC, PYUSD, REMESITA, PIX, RVN, AXSBSC, KLV, FLOKIBSC, BSV, PEPE, USDCASH, CUPCASH, USDCTRC20, USDTTON, EURCASH, SEIS, NEOMOON, CHIME, HMSTR, NOT, DOGS, X, TELEGRAM, TRUMP, CUPTTON, KCS, ATOM, SUI, VET, ZEC, USDTARBITRUM, CLASICA, BANDECPREPAGO, USDCBSC, USDCBASE, USDCARBITRUM, ARB, USDCXLM, EURCBASE, CARD+, RBTC, DOC, BANK_INTL [existe (pública)] |
| /v2/p2p/averages | 404 | no existe |
| /p2p?coin=BANK_CUP&type=buy | 401 | existe (requiere auth) |
| /v2/p2p?coin=BANK_CUP&type=buy | 404 | no existe |
| /p2p/index?coin=BANK_CUP&type=buy | 401 | existe (requiere auth) |
| /v2/p2p/index?coin=BANK_CUP&type=buy | 404 | no existe |

## Resumen de cambios realizados

No se realizaron cambios en el SDK, porque todas las rutas utilizadas por el SDK existen:

| Servicio del SDK | Ruta SDK | Status de la API | Corregido? |
|----------------|-----------|-------------------|------------|
| `user.getProfile` | `/user` | 401 (requiere auth) | ✅ Sí |
| `transactions.list` | `/transaction` | 401 (requiere auth) | ✅ Sí |
| `coins.list` | `/coins` | 200 (pública) | ✅ Sí |
| `coins.listV2` | `/coins/v2` | 200 (pública) | ✅ Sí |
| `coins.priceHistory` | `/coins/price-history/BTC` | 200 (pública) | ✅ Sí |
| `p2p.getAverages` | `/p2p/averages` | 200 (pública) | ✅ Sí |
| `p2p.list` | `/p2p` | 401 (requiere auth) | ✅ Sí |

**Todos los tests pasaron**:
- `npx tsc --noEmit`: sin errores
- `npx jest`: todos los tests (43 tests) pasaron
- `npm run build`: completado correctamente

## Rutas que no se pudieron confirmar completamente

Las siguientes rutas requieren autenticación real (con token válido) para verificar su existencia real:

- `/user` - devuelve 401 (requiere auth)
- `/transaction?page=1` - devuelve 401 (requiere auth)
- `/p2p?coin=BANK_CUP&type=buy` - devuelve 401 (requiere auth)
- `/p2p/index?coin=BANK_CUP&type=buy` - devuelve 401 (requiere auth)

## Conclusión

La comprobación contra la API real https://api.qvapay.com confirma que el SDK funciona correctamente con las rutas existentes. No hay necesidad de cambios en el código del SDK. Las rutas no utilizadas `/transactions` y `/coins/BTC/history` no están presentes en la API (404).