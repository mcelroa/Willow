using Application.CheckIns.DTOs;
using Application.Medications.DTOs;
using Application.Questions.DTOs;
using Application.Sharing.DTOs;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<CheckIn, CheckInDto>();
        CreateMap<SaveCheckInDto, CheckIn>();
        CreateMap<Question, QuestionDto>();
        CreateMap<CreateQuestionDto, Question>();
        CreateMap<ShareLink, ShareLinkDto>()
            .ForMember(d => d.IsRevoked, o => o.MapFrom(s => s.RevokedAt.HasValue));

        CreateMap<Medication, MedicationDto>();
        CreateMap<MedicationSchedule, MedicationScheduleDto>()
            .ForMember(d => d.Time, o => o.MapFrom(s => s.Time.ToString("HH:mm")));
    }
}
