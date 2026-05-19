using Application.CheckIns.DTOs;
using Application.Questions.DTOs;
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
    }
}
