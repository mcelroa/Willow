using System;
using Domain;

namespace Persistence;

public class DbInitializer
{
    public static async Task SeedData(AppDbContext context)
    {
        if (context.CheckIns.Any()) return;

        var checkIns = new List<CheckIn>
        {
            new()
            {
                Mood = 1,
                Pain = 1,
                Fatigue = 1,
                Nausea = 1,
            },
            new()
            {
                Mood = 6,
                Pain = 3,
                Fatigue = 2,
                Nausea = 6,
            },
            new()
            {
                Mood = 3,
                Pain = 1,
                Fatigue = 2,
                Nausea = 5,
            },
            new()
            {
                Mood = 10,
                Pain = 2,
                Fatigue = 2,
                Nausea = 1,
            },
        };

        context.CheckIns.AddRange(checkIns);

        await context.SaveChangesAsync();
    }
}
