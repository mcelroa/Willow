using Application.Core;
using Application.Core.Interfaces;
using Application.Medications.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Medications.Queries;

public class GetMedications
{
    public class Query : IRequest<Result<List<MedicationDto>>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<MedicationDto>>>
    {
        public async Task<Result<List<MedicationDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var medications = await context.Medications
                .Where(m => m.UserId == userAccessor.GetUserId())
                .OrderBy(m => m.Name)
                .ProjectTo<MedicationDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<MedicationDto>>.Success(medications);
        }
    }
}
