<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CurrencyService;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    protected $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    /**
     * Obtenir le taux de change actuel CNY -> XOF
     */
    public function getExchangeRate(Request $request)
    {
        try {
            $from = $request->input('from', 'CNY');
            $to = $request->input('to', 'XOF');

            $rate = $this->currencyService->getExchangeRate($from, $to);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'from' => $from,
                    'to' => $to,
                    'rate' => $rate,
                    'updated_at' => now()->toISOString(),
                    'formatted' => "1 {$from} = " . number_format($rate, 2) . " {$to}"
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get exchange rate: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convertir un montant
     */
    public function convert(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'from' => 'sometimes|string|size:3',
            'to' => 'sometimes|string|size:3'
        ]);

        try {
            $amount = $request->input('amount');
            $from = $request->input('from', 'CNY');
            $to = $request->input('to', 'XOF');

            $convertedAmount = $this->currencyService->convert($amount, $from, $to);
            $rate = $this->currencyService->getExchangeRate($from, $to);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'original' => [
                        'amount' => $amount,
                        'currency' => $from,
                        'formatted' => $from === 'CNY'
                            ? $this->currencyService->formatRMB($amount)
                            : number_format($amount, 2) . ' ' . $from
                    ],
                    'converted' => [
                        'amount' => $convertedAmount,
                        'currency' => $to,
                        'formatted' => $to === 'XOF'
                            ? $this->currencyService->formatXOF($convertedAmount)
                            : number_format($convertedAmount, 2) . ' ' . $to
                    ],
                    'exchange_rate' => $rate,
                    'calculation' => "{$amount} {$from} × {$rate} = {$convertedAmount} {$to}"
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversion failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les informations de prix pour un montant en RMB
     */
    public function getPriceInfo(Request $request)
    {
        $request->validate([
            'price' => 'required|numeric|min:0'
        ]);

        try {
            $priceRMB = $request->input('price');
            $priceInfo = $this->currencyService->getPriceInfo($priceRMB);

            return response()->json([
                'status' => 'success',
                'data' => $priceInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get price info: ' . $e->getMessage()
            ], 500);
        }
    }
}
