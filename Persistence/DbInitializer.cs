using System;
using Domain;

namespace Persistence;

public class DbInitializer
{
    public static async Task SeedData(AppDbContext context)
    {
        if (context.CheckIns.Any()) return;

        var rng = new Random();
        var today = DateOnly.FromDateTime(DateTime.Today);

        DateOnly RandomPastDate() =>
            today.AddDays(-rng.Next(1, 365));

        var checkIns = new List<CheckIn>
        {
            new()
            {
                Mood = 1,
                Pain = 1,
                Fatigue = 1,
                Nausea = 1,
                Date = RandomPastDate()
            },
            new()
            {
                Mood = 6,
                Pain = 3,
                Fatigue = 2,
                Nausea = 6,
                Date = RandomPastDate()
            },
            new()
            {
                Mood = 3,
                Pain = 1,
                Fatigue = 2,
                Nausea = 5,
                Date = RandomPastDate()
            },
            new()
            {
                Mood = 10,
                Pain = 2,
                Fatigue = 2,
                Nausea = 1,
                Date = RandomPastDate()
            },
        };

        context.CheckIns.AddRange(checkIns);

        await context.SaveChangesAsync();
    }
}
