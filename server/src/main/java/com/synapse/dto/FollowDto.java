package com.synapse.dto;

import com.synapse.entity.Follow;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowDto {

    private Long id;
    private UserDto follower;
    private UserDto following;
    private Instant createdAt;

    public static FollowDto fromEntity(Follow follow) {
        return FollowDto.builder()
                .id(follow.getId())
                .follower(UserDto.fromEntity(follow.getFollower()))
                .following(UserDto.fromEntity(follow.getFollowing()))
                .createdAt(follow.getCreatedAt())
                .build();
    }
}
