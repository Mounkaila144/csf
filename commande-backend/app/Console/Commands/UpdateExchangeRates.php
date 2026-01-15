<?php

namespace App\Console\Commands;

use App\Services\CurrencyService;
use Illuminate\Console\Command;

class UpdateExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'currency:update-rates {--force : Force update even if cache is valid}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update exchange rates from external API';

    protected $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        parent::__construct();
        $this->currencyService = $currencyService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating exchange rates...');

        try {
            // Forcer la mise à jour du cache si --force est spécifié
            if ($this->option('force')) {
                \Cache::forget('exchange_rate_CNY_XOF');
                $this->info('Cache cleared. Fetching fresh rates...');
            }

            // Récupérer le taux CNY -> XOF
            $rate = $this->currencyService->getExchangeRate('CNY', 'XOF');

            $this->info("✓ Exchange rate updated successfully!");
            $this->info("  1 CNY = {$rate} XOF");
            $this->info("  Updated at: " . now()->toDateTimeString());

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Failed to update exchange rates: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
