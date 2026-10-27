using System;
using Avond4Daagse.Services;

class Program
{
    static void Main()
    {
        Console.WriteLine("=== TEST PASSWORD SERVICE ===");

        string wachtwoord = "Welkom123!";

        // 1. Hashen via de service
        string hash = PasswordService.Hash(wachtwoord);
        Console.WriteLine($"Gegenereerde Hash: {hash}");

        // 2. Verifiëren via de service
        bool checkGoed = PasswordService.Verify("Welkom123!", hash);
        bool checkFout = PasswordService.Verify("FoutWachtwoord", hash);

        Console.WriteLine($"Check correct: {checkGoed}"); // Moet True zijn
        Console.WriteLine($"Check incorrect: {checkFout}"); // Moet False zijn
    }
}