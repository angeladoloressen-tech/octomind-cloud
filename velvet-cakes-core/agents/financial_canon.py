#!/usr/bin/env python3
import os
import json
import random
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

try:
    from web3 import Web3
except ImportError:
    Web3 = None

ROOT = Path(__file__).resolve().parent
CANON_FILE = ROOT / "financial_canon_memory.json"


def safe_load_json(path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default
    return default


class DeFiMarketSensor:
    def __init__(self):
        self.coingecko_url = "https://api.coingecko.com/api/v3/coins/markets"

    def fetch_opportunities(self):
        print("🔎 [MarketSensor] DeFi fırsatları aranıyor...")
        try:
            response = requests.get(self.coingecko_url, params={
                "vs_currency": "usd",
                "ids": "aave,compound-governance-token,ethereum,usd-coin,dai",
                "order": "market_cap_desc",
                "per_page": 10,
                "page": 1,
                "sparkline": False,
            }, timeout=10)
            data = response.json()
            prices = {item["id"]: item["current_price"] for item in data}
        except Exception:
            prices = {
                "aave": 90.0,
                "compound-governance-token": 100.0,
                "ethereum": 3600.0,
                "usd-coin": 1.0,
                "dai": 1.0,
            }

        opportunities = {
            "Aave": {
                "asset": "USDC",
                "expected_apy": random.uniform(3.5, 7.5),
                "risk_score": 0.2,
                "source": "decentralized_lending",
            },
            "Compound": {
                "asset": "DAI",
                "expected_apy": random.uniform(2.5, 6.0),
                "risk_score": 0.25,
                "source": "decentralized_lending",
            },
            "Curve Stablecoin Pool": {
                "asset": "USDC/DAI",
                "expected_apy": random.uniform(4.0, 9.0),
                "risk_score": 0.35,
                "source": "liquidity_pool",
            },
            "Staked ETH": {
                "asset": "wstETH",
                "expected_apy": random.uniform(2.0, 5.0),
                "risk_score": 0.4,
                "source": "staking",
            },
        }

        demand_signal = self._read_trend_signal()
        opportunities["Aave"]["trend"] = demand_signal
        opportunities["Compound"]["trend"] = demand_signal
        opportunities["Curve Stablecoin Pool"]["trend"] = demand_signal
        opportunities["Staked ETH"]["trend"] = demand_signal

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "prices": prices,
            "opportunities": opportunities,
            "wallet_address": os.getenv("TREASURY_WALLET_ADDRESS", "<wallet-not-configured>"),
        }

    def _read_trend_signal(self):
        trend = os.getenv("MARKET_TREND_SIGNAL", "defensive")
        if trend not in ["defensive", "balanced", "aggressive"]:
            trend = "balanced"
        print(f"📈 [MarketSensor] Trend sinyali: {trend}")
        return trend


class StrategyGenerator:
    def __init__(self):
        self.exploration_pool = [
            "Aave",
            "Compound",
            "Curve Stablecoin Pool",
            "Staked ETH",
        ]

    def generate(self, market_data, treasury_balance):
        opportunities = market_data["opportunities"]
        best = max(opportunities.items(), key=lambda item: item[1]["expected_apy"] - item[1]["risk_score"])
        protocol_name, protocol = best

        allocation = min(50.0, treasury_balance * 0.05)
        if market_data["opportunities"][protocol_name]["trend"] == "aggressive":
            allocation *= 1.25

        strategy = {
            "id": f"strategy_{int(time.time())}_{random.randint(100,999)}",
            "protocol": protocol_name,
            "asset": protocol["asset"],
            "allocation_usd": round(allocation, 2),
            "expected_apy": round(protocol["expected_apy"], 2),
            "risk_score": round(protocol["risk_score"], 2),
            "trend": protocol["trend"],
            "hypothesis": f"Small allocation to {protocol_name} yields better risk-adjusted return than staying in cash.",
            "created_at": datetime.utcnow().isoformat(),
        }
        print(f"💡 [StrategyGenerator] Yeni strateji: {strategy['protocol']} {strategy['allocation_usd']}$")
        return strategy


class MicroTestRunner:
    def execute(self, strategy):
        print(f"🧪 [MicroTestRunner] {strategy['id']} için mikro deneme başlatılıyor...")
        budget = strategy["allocation_usd"]
        volatility = 1 + random.uniform(-0.09, 0.12)
        gross_return = budget * (strategy["expected_apy"] / 100) * random.uniform(0.25, 1.0)

        results = {
            "strategy_id": strategy["id"],
            "protocol": strategy["protocol"],
            "allocation_usd": budget,
            "gross_return_usd": round(gross_return, 2),
            "fees_usd": round(max(0.5, budget * 0.003), 2),
            "duration_days": random.randint(1, 3),
            "simulated_outcome": random.choice(["positive", "neutral", "negative"]),
            "timestamp": datetime.utcnow().isoformat(),
        }
        results["net_return_usd"] = round(results["gross_return_usd"] - results["fees_usd"], 2)
        results["roi"] = round(results["net_return_usd"] / budget, 4) if budget else 0
        print(f"✅ [MicroTestRunner] Sonuç: ROI {results['roi']:.2%}, net {results['net_return_usd']}$")
        return results


class RewardEvaluator:
    def evaluate(self, test_result):
        reward = test_result["net_return_usd"]
        penalty = test_result["fees_usd"] + 0.0

        score = reward - penalty
        decision = "SCALE" if test_result["roi"] >= 0.15 else "KILL"
        print(f"🎯 [RewardEvaluator] Reward: {reward}$, Score: {score}$ -> {decision}")
        return {
            "score": round(score, 2),
            "decision": decision,
            "roi": test_result["roi"],
            "net_return_usd": test_result["net_return_usd"],
        }


class TreasuryManager:
    def __init__(self, initial_balance):
        self.balance = initial_balance
        self.allocations = []

    def commit(self, strategy, test_result):
        scale_factor = 10 if test_result["roi"] > 0.3 else 5
        new_allocation = min(self.balance, strategy["allocation_usd"] * scale_factor)
        self.balance = round(self.balance - new_allocation, 2)
        allocation = {
            "strategy_id": strategy["id"],
            "protocol": strategy["protocol"],
            "allocated_usd": round(new_allocation, 2),
            "timestamp": datetime.utcnow().isoformat(),
            "roi": test_result["roi"],
        }
        self.allocations.append(allocation)
        print(f"📈 [TreasuryManager] {allocation['allocated_usd']}$ taahhüt edildi: {allocation['protocol']}")
        return allocation

    def settle(self, test_result):
        recovered = round(test_result["allocation_usd"] + test_result["net_return_usd"], 2)
        self.balance = round(self.balance + recovered, 2)
        print(f"💰 [TreasuryManager] Pozisyon kapandı, bakiye: {self.balance}$")


class FinancialCanonEngine:
    def __init__(self):
        load_dotenv(dotenv_path=ROOT / "../.env")
        self.starting_balance = float(os.getenv("STARTING_BALANCE_USD", 1000.0))
        self.treasury = TreasuryManager(initial_balance=self.starting_balance)
        self.sensor = DeFiMarketSensor()
        self.generator = StrategyGenerator()
        self.runner = MicroTestRunner()
        self.evaluator = RewardEvaluator()
        self.memory = safe_load_json(CANON_FILE, default={"learned": [], "history": []}) or {"learned": [], "history": []}

    def build_engine(self, iterations=4):
        print("\n👑 [FinancialCanon] Otonom finans motoru başlatılıyor...")
        for i in range(iterations):
            print(f"\n--- Döngü #{i+1} ---")
            market_data = self.sensor.fetch_opportunities()
            strategy = self.generator.generate(market_data, self.treasury.balance)
            result = self.runner.execute(strategy)
            evaluation = self.evaluator.evaluate(result)
            self.memory["history"].append({"strategy": strategy, "result": result, "evaluation": evaluation})

            if evaluation["decision"] == "SCALE":
                allocation = self.treasury.commit(strategy, result)
                self.memory["learned"].append({"strategy": strategy, "allocation": allocation, "result": result})
            else:
                print("🗑️ [FinancialCanon] Strateji öldürüldü, sermaye korundu.")
                self.treasury.settle(result)

            time.sleep(1)

        self._persist_memory()
        self._summarize()

    def _persist_memory(self):
        CANON_FILE.write_text(json.dumps(self.memory, indent=2, ensure_ascii=False))
        print(f"💾 [FinancialCanon] Öğrenme hafızası kaydedildi: {CANON_FILE}")

    def _summarize(self):
        print("\n📜 [FinancialCanon] Kayıtlı kazanımlar:")
        for item in self.memory["learned"]:
            print(f" - {item['strategy']['protocol']} | ROI {item['result']['roi']:.2%} | allocation {item['allocation']['allocated_usd']}$")
        print(f"\n💵 Son bakiye: {self.treasury.balance}$")


if __name__ == "__main__":
    engine = FinancialCanonEngine()
    engine.build_engine(iterations=5)
