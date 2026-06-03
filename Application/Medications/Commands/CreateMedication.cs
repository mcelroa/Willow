using Application.Core;
using Application.Core.Interfaces;
using Application.Medications.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.Medications.Commands;

public class CreateMedication
{
    public class Command : IRequest<Result<MedicationDto>>
    {
        public SaveMedicationDto Dto { get; set; } = null!;
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<MedicationDto>>
    {
        public async Task<Result<MedicationDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var medication = new Medication
            {
                Name = request.Dto.Name,
                Dosage = request.Dto.Dosage,
                TargetSymptom = request.Dto.TargetSymptom,
                IsActive = request.Dto.IsActive,
                UserId = userAccessor.GetUserId(),
                Schedules = request.Dto.Schedules.Select(s => new MedicationSchedule
                {
                    DayOfWeek = s.DayOfWeek,
                    Time = TimeOnly.Parse(s.Time),
                }).ToList(),
            };

            context.Medications.Add(medication);

            var success = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!success) return Result<MedicationDto>.Failure("Failed to create medication", 400);

            return Result<MedicationDto>.Success(mapper.Map<MedicationDto>(medication));
        }
    }
}
