using System;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.CheckIns.Queries;

public class GetCheckInList
{
    public class Query : IRequest<List<CheckIn>> { }

    public class Handler(AppDbContext context) : IRequestHandler<Query, List<CheckIn>>
    {
        public Task<List<CheckIn>> Handle(Query request, CancellationToken cancellationToken)
        {
            return context.CheckIns.ToListAsync(cancellationToken: cancellationToken);
        }
    }

}
