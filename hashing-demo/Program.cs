using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("=== DEMO: WACHTWOORD HASHING (BCRYPT) ===");

        string pass = "Welkom123!";
        Console.WriteLine($"Wachtwoord: {pass}");

        // Twee keer hashen toont automatische salt aan
        string hash1 = BCrypt.Net.BCrypt.HashPassword(pass);
        string hash2 = BCrypt.Net.BCrypt.HashPassword(pass);

        Console.WriteLine($"Hash 1: {hash1}");
        Console.WriteLine($"Hash 2: {hash2}");

        // Verificatie
        bool kloptWel = BCrypt.Net.BCrypt.Verify("Welkom123!", hash1);
        bool kloptNiet = BCrypt.Net.BCrypt.Verify("FoutWachtwoord", hash1);

        Console.WriteLine($"Check 'Welkom123!': {kloptWel}");
        Console.WriteLine($"Check 'FoutWachtwoord': {kloptNiet}");
    }
}