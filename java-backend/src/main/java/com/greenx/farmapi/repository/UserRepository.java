package com.greenx.farmapi.repository;

import com.greenx.farmapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(String role);

    List<User> findByRoleAndClusterId(String role, String clusterId);

    List<User> findByClusterId(String clusterId);

    @Query("SELECT u FROM User u WHERE UPPER(REPLACE(u.role, '_', '')) = UPPER(REPLACE(:role, '_', ''))")
    List<User> findByRoleFlexible(@Param("role") String role);

    @Query("SELECT u FROM User u WHERE UPPER(REPLACE(u.role, '_', '')) = UPPER(REPLACE(:role, '_', '')) AND u.clusterId = :clusterId")
    List<User> findByRoleFlexibleAndClusterId(@Param("role") String role, @Param("clusterId") String clusterId);
}
