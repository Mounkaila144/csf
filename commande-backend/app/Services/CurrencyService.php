<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CurrencyService
{
    // API gratuite pour les taux de change (jusqu'à 1500 requêtes/mois)
    private const API_URL = 'https://api.exchangerate-api.com/v4/latest/';

    // Alternative : https://open.er-api.com/v6/latest/CNY (gratuit, sans clé)
    private const FALLBACK_API_URL = 'https://open.er-api.com/v6/latest/';

    /**
     * Obtenir le taux de change CNY (RMB) vers XOF
     */
    public function getExchangeRate(string $from = 'CNY', string $to = 'XOF'): float
    {
        // 1. Vérifier le cache (valide 1 heure)
        $cacheKey = "exchange_rate_{$from}_{$to}";

        if ($cachedRate = Cache::get($cacheKey)) {
            return (float) $cachedRate;
        }

        // 2. Vérifier la base de données (si moins de 24h)
        $dbRate = ExchangeRate::where('from_currency', $from)
            ->where('to_currency', $to)
            ->latest('fetched_at')
            ->first();

        if ($dbRate && !$dbRate->isStale()) {
            Cache::put($cacheKey, $dbRate->rate, now()->addHour());
            return (float) $dbRate->rate;
        }

        // 3. Récupérer depuis l'API
        try {
            $rate = $this->fetchFromApi($from, $to);

            // Sauvegarder en base de données
            ExchangeRate::updateOrCreate(
                ['from_currency' => $from, 'to_currency' => $to],
                [
                    'rate' => $rate,
                    'fetched_at' => now()
                ]
            );

            // Mettre en cache
            Cache::put($cacheKey, $rate, now()->addHour());

            return $rate;

        } catch (\Exception $e) {
            Log::error('Failed to fetch exchange rate', [
                'from' => $from,
                'to' => $to,
                'error' => $e->getMessage()
            ]);

            // 4. Fallback : utiliser le dernier taux connu ou un taux par défaut
            if ($dbRate) {
                return (float) $dbRate->rate;
            }

            // Taux de fallback approximatif (à mettre à jour régulièrement)
            // 1 CNY ≈ 85 XOF (janvier 2026)
            return 85.0;
        }
    }

    /**
     * Récupérer le taux depuis l'API
     */
    private function fetchFromApi(string $from, string $to): float
    {
        try {
            // Essayer l'API principale
            $response = Http::timeout(5)
                ->get(self::API_URL . $from);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['rates'][$to])) {
                    return (float) $data['rates'][$to];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Primary API failed, trying fallback', ['error' => $e->getMessage()]);
        }

        // Essayer l'API de secours
        $response = Http::timeout(5)
            ->get(self::FALLBACK_API_URL . $from);

        if ($response->successful()) {
            $data = $response->json();

            if (isset($data['rates'][$to])) {
                return (float) $data['rates'][$to];
            }
        }

        throw new \Exception('Unable to fetch exchange rate from any API');
    }

    /**
     * Convertir un montant de CNY vers XOF
     */
    public function convert(float $amount, string $from = 'CNY', string $to = 'XOF'): float
    {
        $rate = $this->getExchangeRate($from, $to);
        return round($amount * $rate, 0); // XOF n'a pas de centimes
    }

    /**
     * Formater un prix en RMB
     */
    public function formatRMB(float $amount): string
    {
        return number_format($amount, 2, '.', ' ') . ' ¥';
    }

    /**
     * Formater un prix en XOF
     */
    public function formatXOF(float $amount): string
    {
        return number_format($amount, 0, '', ' ') . ' FCFA';
    }

    /**
     * Obtenir les informations de prix dans les deux devises
     */
    public function getPriceInfo(float $priceRMB): array
    {
        $priceXOF = $this->convert($priceRMB);
        $rate = $this->getExchangeRate();

        return [
            'rmb' => [
                'amount' => $priceRMB,
                'formatted' => $this->formatRMB($priceRMB),
                'currency' => 'CNY',
                'symbol' => '¥'
            ],
            'xof' => [
                'amount' => $priceXOF,
                'formatted' => $this->formatXOF($priceXOF),
                'currency' => 'XOF',
                'symbol' => 'FCFA'
            ],
            'exchange_rate' => $rate,
            'updated_at' => now()->toISOString()
        ];
    }
}
